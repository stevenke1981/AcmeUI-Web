/** Parse everything before resolving or creating an output directory. */
export function parseArguments(args) {
  const [command = 'help', ...rest] = args;
  if (['help', '--help', '-h', 'list'].includes(command)) {
    if (rest.length) throw new Error(`${command} 不接受額外參數。`);
    return { command: command === 'list' ? 'list' : 'help' };
  }
  if (command !== 'create') throw new Error(`未知指令：${command}`);
  if (rest.length === 1 && ['--help', '-h'].includes(rest[0])) return { command: 'help' };
  const values = new Map();
  let name;
  for (let index = 0; index < rest.length; index++) {
    const arg = rest[index];
    if (!arg.startsWith('-')) {
      if (name !== undefined) throw new Error(`多餘的專案名稱：${arg}`);
      name = arg; continue;
    }
    const equal = arg.indexOf('=');
    const flag = equal < 0 ? arg : arg.slice(0, equal);
    if (!['--framework', '--template', '--out'].includes(flag)) throw new Error(`未知參數：${flag}`);
    if (values.has(flag)) throw new Error(`重複參數：${flag}`);
    const value = equal < 0 ? rest[++index] : arg.slice(equal + 1);
    if (!value?.trim() || value.startsWith('-')) throw new Error(`參數缺值：${flag}`);
    values.set(flag, value);
  }
  if (!name || !/^[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(name)) throw new Error('專案名稱只能使用英數字、點、底線與連字號。');
  return { command, name, framework: values.get('--framework') ?? 'react', slug: values.get('--template') ?? 'saas-launch', out: values.get('--out') ?? name };
}
