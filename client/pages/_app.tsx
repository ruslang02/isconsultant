import React, { useState } from 'react'
import '../styles/globals.css'
import 'semantic-ui-css/semantic.min.css'
import { AuthContext } from "utils/AuthContext";


function MyApp({ Component, pageProps }: { Component: new () => JSX.ElementClass, pageProps: Record<string, string> }) {
  const [auth, setAuth] = useState<{ access_token: string } | null>(
    typeof window !== "undefined" ? JSON.parse(localStorage.getItem("auth") || "null") : null
  );
  
  typeof window !== "undefined" && localStorage.setItem("auth", JSON.stringify(auth));

  return (
    <AuthContext.Provider value={{ auth, setAuth }}>
      <Component {...pageProps} />
    </AuthContext.Provider>
  );
}

export default MyApp
