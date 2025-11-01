import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://geulombomgwgqcmbkahr.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdldWxvbWJvbWd3Z3FjbWJrYWhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3MjAyNjQsImV4cCI6MjA3NzI5NjI2NH0.1cYIf2ZLXNE0uYjK-8G39th7aDCZ75XnUcSCNYUYpr4"
);

const test = async () => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: "vaishnavitest1@gmail.com",
    password: "testing123",
  });
  console.log("data:", data);
  console.log("error:", error);
};

test();
