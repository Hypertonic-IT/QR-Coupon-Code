const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const fetchAPI = async (endpoint, options = {}) => {
    const url = `${API_URL}${endpoint}`;

    // Standard options for withCredentials
    options.credentials = options.credentials || 'include';

    if (options.body && !(options.body instanceof FormData)) {
        options.headers = {
            ...options.headers,
            'Content-Type': 'application/json',
        };
        options.body = JSON.stringify(options.body);
    }

    const res = await fetch(url, options);
    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.message || 'API request failed');
    }

    return data;
};
