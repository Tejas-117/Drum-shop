/*
  File: zoho.ts
  Description: This exports a axios instance configured to be used 
  to interact with the zoho apis
*/

import axios, {AxiosInstance} from 'axios';

const zohoApiBaseUrl = process.env.ZOHO_BASE_API_URL!;
const zohoAuthUrl = process.env.ZOHO_AUTH_API_URL!;
let zohoAccessToken = '';

function getZohoAxiosInstance() {
  const zohoAxiosInstance: AxiosInstance = axios.create({
    baseURL: zohoApiBaseUrl,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': zohoAccessToken,
    }
  });

  /* This response interceptor would be utilised when the access token expires
    and request will be sent to refresh the token and then retry the previous request.
  */
  const tokenInterceptorErrHandler = (error: any) => {
    const prevRequest = error?.config;
    const prevStatus = error?.response?.status;

    // this error code implies the access token has expired
    if (prevStatus === 401 && !prevRequest.retry) {
      prevRequest.retry = true;

      // send a network request to refresh token
      const params = {
        refresh_token: process.env.ZOHO_REFRESH_TOKEN!,
        client_id: process.env.ZOHO_CLIENT_ID!,
        client_secret: process.env.ZOHO_CLIENT_SECRET!,
        grant_type: 'refresh_token'
      };

      return axios.post(zohoAuthUrl, null, {
        params: params
      })
          .then((res) => {
            // get the access token present in the data
            const {access_token} = res.data;
            
            // store the access token in the global variable
            zohoAccessToken = access_token;

            /* if the access token was successfully retrieved, retry the
              previous request with the correct access token */
            if (res.status === 200) {
              return zohoAxiosInstance(prevRequest);
            }
          })
          .catch((err) => {
            return Promise.reject(err);
          });
    }

    // reject other errors
    return Promise.reject(error);
  };

  // response interceptor
  zohoAxiosInstance.interceptors.response.use(
    (response) => response,
    tokenInterceptorErrHandler,
  );
  
  // request interceptor
  zohoAxiosInstance.interceptors.request.use(function (config) {
    config.headers.Authorization = `Zoho-oauthtoken ${zohoAccessToken}`;

    return config;
  })

  return zohoAxiosInstance;
}

// fetch with interceptor capabilities
async function zohoFetch(
  path: string,
  options: ResponseInit,
  retry: boolean = false,
) {
  const url = `${zohoApiBaseUrl}${path}`

  // add token and content-type to the headers
  options.headers = {
    ...options.headers,
    'Content-Type': 'application/json',
    'Authorization': `Zoho-oauthtoken ${zohoAccessToken}`,
  }

  try {
    const res = await fetch(url, options);   

    if (res.ok === false) {
      // if already retried the current request, return;
      if (retry === true) {
        throw new Error(`Zoho HTTP error, status: ${res.status}`)
      }

      if (res.status === 401) {
        // get a new access token
        const {access_token} = await fetchAccessToken();

        if (access_token) {
          // retry the previous request.
          return zohoFetch(path, options, true);
        }
      }
      else {
        throw new Error(`Zoho HTTP error, status: ${res.status}`);
      }
    } else {
      const data = await res.json();
      return data;
    }
  } catch (error) {
    console.log(error);
    return null;
  }
}

// function to fetch new access token
async function fetchAccessToken(): Promise<{access_token: string}> {
  try {
    // format the query params and add it to the url
    const queryParams = {
      refresh_token: process.env.ZOHO_REFRESH_TOKEN!,
      client_id: process.env.ZOHO_CLIENT_ID!,
      client_secret: process.env.ZOHO_CLIENT_SECRET!,
      grant_type: 'refresh_token'
    };
    
    const queryString = new URLSearchParams(queryParams).toString();
    const authUrl = `${zohoAuthUrl}?${queryString}`;
    
    const authRes = await fetch(authUrl, {
      method: 'POST',
    });

    // if successfully fetched a new access token
    if (authRes.ok) {
      const data = await authRes.json();
      const {access_token} = data;

      // store the access token in the global variable
      zohoAccessToken = access_token;
      return {access_token};
    } else {
      throw new Error(`Zoho access token, HTTP error: ${authRes.status}`)
    }
  } catch (error) {
    throw error;
  }
}

export {
  zohoFetch,
}
