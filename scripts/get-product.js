#!/usr/bin/env node
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

async function getById(id) {
  const { data, error } = await supabase
    .from("products")
    .select("id, nombre, precio, categoria, metadata")
    .eq("id", id)
    .single();
  if (error) {
    console.error("Error:", error);
    process.exit(2);
  }
  console.log(JSON.stringify(data, null, 2));
}

async function searchByName(q) {
  const { data, error } = await supabase
    .from("products")
    .select("id, nombre, precio, categoria, metadata")
    .ilike("nombre", `%${q}%`)
    .limit(20);
  if (error) {
    console.error("Error:", error);
    process.exit(2);
  }
  console.log(JSON.stringify(data, null, 2));
}

const args = process.argv.slice(2);
if (args.length === 0) {
  console.log(
    `Uso:\n  node scripts/get-product.js id <PRODUCT_ID>\n  node scripts/get-product.js buscar "termino"`,
  );
  process.exit(0);
}

if (args[0] === "buscar" && args[1]) {
  searchByName(args[1]);
} else if (args[0] === "id" && args[1]) {
  getById(args[1]);
} else {
  // also support direct id as first arg
  if (args.length === 1) {
    getById(args[0]);
  } else {
    console.log("Argumentos inválidos");
    process.exit(1);
  }
}
