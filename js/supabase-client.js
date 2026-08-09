import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://syycggibqwvqravtdhhx.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5eWNnZ2licXd2cXJhdnRkaGh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ1MjA4NDIsImV4cCI6MjEwMDA5Njg0Mn0.1A50etqd78iHVgQC7uVUM2fRovssgn3M9yfdXVkQHTM";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
window.supabase = supabase;
