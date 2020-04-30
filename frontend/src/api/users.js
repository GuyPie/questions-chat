export const getUserInfo = () =>
  fetch('https://randomuser.me/api/').then(async response => {
    const { results } = await response.json();
    return results[0].login;
  });
