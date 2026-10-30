// ===== Supabase Client & Data Layer =====

const SUPABASE_URL = "https://hffcdvlroxeqkjsickqv.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhmZmNkdmxyb3hlcWtqc2lja3F2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcxODUwMzgsImV4cCI6MjEwMjc2MTAzOH0.ps4i58qvASjJss4IWCuXoGA7FmNtow1wGrkDxhh0I9o";

const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ===== Auth =====

async function sbSignUp(email, password) {
  const { data, error } = await sb.auth.signUp({ email, password });
  if (error) throw error;
  return data;
}

async function sbSignIn(email, password) {
  const { data, error } = await sb.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

async function sbSignOut() {
  const { error } = await sb.auth.signOut();
  if (error) throw error;
}

async function sbGetUser() {
  const {
    data: { user },
  } = await sb.auth.getUser();
  return user;
}

function sbOnAuthChange(callback) {
  sb.auth.onAuthStateChange((_event, session) => {
    callback(session?.user || null, _event);
  });
}

// ===== Profile (Settings) =====

async function sbLoadProfile() {
  const { data, error } = await sb.from("profiles").select("*").maybeSingle();
  if (error) throw error;
  if (!data) {
    const user = await sbGetUser();
    if (user) {
      await sb.from("profiles").upsert({
        id: user.id,
        target: 20,
        start_date: "2026-11-02",
        num_periods: 14,
      });
    }
    return { target: 20, start: "2026-11-02", n: 14 };
  }
  return {
    target: Number(data.target),
    start: data.start_date,
    n: data.num_periods,
    avatar: data.avatar_url || null,
  };
}

async function sbSaveProfile(settings) {
  const user = await sbGetUser();
  const updateData = {
    target: settings.target,
    start_date: settings.start,
    num_periods: settings.n,
  };
  if (settings.avatar !== undefined) {
    updateData.avatar_url = settings.avatar;
  }
  const { error } = await sb.from("profiles").update(updateData).eq("id", user.id);
  if (error && updateData.avatar_url) {
    // If avatar_url column doesn't exist yet on database, fallback to updating without it
    delete updateData.avatar_url;
    await sb.from("profiles").update(updateData).eq("id", user.id);
  } else if (error) {
    throw error;
  }
}

// ===== Transactions =====

async function sbLoadTransactions() {
  const { data, error } = await sb
    .from("transactions")
    .select("*")
    .order("tx_date", { ascending: false });
  if (error) throw error;
  return data.map((row) => ({
    id: row.id,
    d: row.tx_date,
    t: row.type,
    c: row.category,
    a: Number(row.amount),
    n: row.note || "",
  }));
}

async function sbAddTransaction(tx) {
  const user = await sbGetUser();
  const { data, error } = await sb
    .from("transactions")
    .insert({
      user_id: user.id,
      tx_date: tx.d,
      type: tx.t,
      category: tx.c,
      amount: tx.a,
      note: tx.n || "",
    })
    .select()
    .single();
  if (error) throw error;
  return {
    id: data.id,
    d: data.tx_date,
    t: data.type,
    c: data.category,
    a: Number(data.amount),
    n: data.note || "",
  };
}

async function sbDeleteTransaction(id) {
  const { error } = await sb.from("transactions").delete().eq("id", id);
  if (error) throw error;
}

// ===== Bulk Import (localStorage → Supabase) =====

async function sbImportData(localState) {
  const user = await sbGetUser();

  // Update profile/settings
  if (localState.s) {
    await sbSaveProfile(localState.s);
  }

  // Import transactions
  if (localState.tx && localState.tx.length > 0) {
    const rows = localState.tx.map((tx) => ({
      user_id: user.id,
      tx_date: tx.d,
      type: tx.t,
      category: tx.c,
      amount: tx.a,
      note: tx.n || "",
    }));
    const { error } = await sb.from("transactions").insert(rows);
    if (error) throw error;
  }
}

