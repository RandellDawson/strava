import fetch from 'node-fetch';

const request = async ({ method, url, headers, body }) => {
  let requestOptions = { method };

  if (headers) {
    requestOptions = { ...requestOptions, headers };
  }

  if (body) {
    requestOptions = {
      ...requestOptions,
      body: JSON.stringify({ ...body })
    };
  }

  const response = await fetch(url, requestOptions);

  let data;
  const text = await response.text();

  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }

  if (!response.ok) {
    const error = new Error(
      `Request failed: ${method} ${url} -> ${response.status} ${response.statusText}`
    );
    error.status = response.status;
    error.statusText = response.statusText;
    error.data = data;
    throw error;
  }

  return data;
};

export default request;