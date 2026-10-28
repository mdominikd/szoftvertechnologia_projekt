import "@mantine/core/styles.css"
import { useAuth } from './auth'
import { Navigate, Route, Routes } from 'react-router'
import LoginPage from './pages/LoginPage'
import Layout, { MENU } from './Layout'
import UsersPage from './pages/UsersPage'
import PartsPage from './pages/PartsPage'
import WarehousePage from './pages/WarehousePage'
import StockInPage from "./pages/StockInPage"
import ProjectPage from "./pages/ProjectsPage"
import ProjectDetalPage from "./pages/ProjectDetailPage"
import MisssingPage from "./pages/MissingPage"
import PickingListPage from "./pages/PickingListPage"
import PickingPage from './pages/PickingPage'

function App() {
  const {user} = useAuth();

  if(!user){
    return (
      <Routes>
        <Route path='/login' element={<LoginPage/>} />
        <Route path='*' element={<Navigate to="/login" replace/>} />
      </Routes>
    );
  }

  const role =user.role;
  return (
      <Layout>
        <Routes>
          {role === 'ADMIN' && <Route path='/users' element={<UsersPage/>} />}
          {(role === 'WH_MANAGER' || role === 'SPECIALIST') && <Route path='/parts' element={<PartsPage/>} />}
          {role === 'WH_MANAGER' && <Route path='/stock-in' element={<StockInPage/>} />}
          {role === 'WH_MANAGER' && <Route path='/missing' element={<MisssingPage/>} />}
          {role === 'WH_WORKER' && <Route path='/picking' element={<PickingListPage/>} />}
          {role === 'WH_WORKER' && <Route path='/picking/:id' element={<PickingPage/>} />}
          {role === 'SPECIALIST' && <Route path="/projects" element={<ProjectPage/>} />}
          {role === 'SPECIALIST' && <Route path="/projects/:id" element={<ProjectDetalPage/>} />}
          {(role === 'WH_MANAGER' || role === 'WH_WORKER') && (<Route path='/warehouse' element={<WarehousePage/>} />)}
          {/*Minden mas utvonal a szerepkor elso menupontja lesz*/}
          <Route path='*' element={<Navigate to={MENU[role][0].path} replace/>} />
        </Routes>
      </Layout>
  )
}

export default App
