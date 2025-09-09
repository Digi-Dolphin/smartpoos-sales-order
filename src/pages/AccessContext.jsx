import { createContext, useState } from "react";

const AccessContext = createContext();

function AccessContextProvider({ children }) {
  const [access, setAccess] = useState('');


  return (
    <AccessContext.Provider value={{ access, setAccess }}>
      {children}
    </AccessContext.Provider>
  );
}

export { AccessContextProvider };

export default AccessContext;