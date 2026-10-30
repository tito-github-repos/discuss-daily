async function saveRegistration(data: {
  name: string;
  email: string;
  phone: string; // E.164, e.g. +919360353287
  country: string;
}) {
  // TODO: replace with your real storage
  console.log('New registration:', data);
}