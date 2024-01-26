import('container/selfhost').then((hosting) => {
  const devRoot = document.querySelector('#_app-dev-root');
  hosting.default(devRoot);
});