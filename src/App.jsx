import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import EditorPage from './components/EditorPage';
import Homepage from './components/Homepage'
import './App.css'
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <>
      <div>
        <Toaster position='top-center' reverseOrder={false} toastOptions={{
          success:{
            theme:{
              primary:'#4aed88',
            }
          }
        }}></Toaster>
      </div>
      <Router>
        <Routes>
          <Route path='/' element={<Homepage />} />
          <Route path='/editor/:roomId' element={<EditorPage />} />
        </Routes>
      </Router>
    </>
  )
}

export default App
