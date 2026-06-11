const API_BASE_URL = 'https://sheaujun.atwebpages.com/api';

function getToken() {
  return localStorage.getItem('mcafe_token');
}

function publicHeaders() {
  return {
    'Content-Type': 'application/json'
  };
}

function authHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + getToken()
  };
}