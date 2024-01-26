export default (array) => {
  const localEntries = [];
  if (array && array.length != 0) {
    localEntries.push(...array);
  } else if (process.env.LOCAL_ENTRIES) {
    const envEntries = process.env.LOCAL_ENTRIES;
    localEntries.push(...envEntries.split(','));
  }
  localEntries.forEach(module => {
    window[`webPackLocalEntry_${module}`] = true;
  });
}
