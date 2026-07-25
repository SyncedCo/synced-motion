#!/usr/bin/env node
import { runMotionCli } from '../dist/cli.js'

const result = await runMotionCli()
if (result.code) process.exitCode = result.code
