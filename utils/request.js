import fetch from 'node-fetch';

const request = async ({ method, url, headers, body }) => {
  let requestOptions = { method };
  if (headers) {
    requestOptions = {
      ...requestOptions,
      headers
    };
  }
  if (body) {
    requestOptions = {
      ...requestOptions,
      body: JSON.stringify({ ...body })
    };
  }

  const response = await fetch(url, requestOptions);
  const data = await response.json();
  return data;
};

export default request;