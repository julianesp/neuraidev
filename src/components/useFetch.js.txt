import UseFetch from "@/components/useFetch";

const useFetch = async (url, options) => {
  // Make a fetch request to the specified URL
  useFetch(url, options);

  // Check if the response was successful
  if (response.ok) {
    // Get the response body
    const body = await response.json();

    // Return the response body
    return body;
  } else {
    // Throw an error
    throw new Error(response.statusText);
  }
};

export default useFetch;
