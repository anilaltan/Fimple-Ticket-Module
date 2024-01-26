#!/usr/bin/env node

const { program } = require("./scripts/program.js");

const main = () => program.parse(process.argv);

main();
