import { Outlet } from "react-router-dom";
import Header from "../components/layout/Header";

function MainLayout() {
  return (
    <>
      <Header />

      <main>
        <Outlet />
      </main>
    </>
  );
}

export default MainLayout;