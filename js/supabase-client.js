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
  const { data, error } = await sb.from("profiles").select("*").single();
  if (error) throw error;
  return {
    target: Number(data.target),
    start: data.start_date,
    n: data.num_periods,
  };
}

async function sbSaveProfile(settings) {
  const user = await sbGetUser();
  const { error } = await sb
    .from("profiles")
    .update({
      target: settings.target,
      start_date: settings.start,
      num_periods: settings.n,
    })
    .eq("id", user.id);
  if (error) throw error;
}

// ===== Transactions =====

async function sbLoadTransactions() {
  const { data, error } = await sb
    .from("transactions")
    .select("*")
    .order("date", { ascending: false });
  if (error) throw error;
  return data.map((row) => ({
    id: row.id,
    d: row.date,
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
      date: tx.d,
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
    d: data.date,
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
      date: tx.d,
      type: tx.t,
      category: tx.c,
      amount: tx.a,
      note: tx.n || "",
    }));
    const { error } = await sb.from("transactions").insert(rows);
    if (error) throw error;
  }
}
