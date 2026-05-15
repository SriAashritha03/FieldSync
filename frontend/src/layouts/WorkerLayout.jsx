import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'

const WorkerLayout = () => {
	return (
		<div className="app-shell">
			<Sidebar />
			<div className="app-main">
				<Navbar />
				<main className="page">
					<Outlet />
				</main>
			</div>
		</div>
	)
}

export default WorkerLayout
