import './App.css'
import './fonts.css'

import { useState } from 'react'

import Header from './components/Header/header';

import Input from './components/input';
import Result from './components/Result/result';

function App() {
  const [data, setData] = useState();
  const [type, setType] = useState('monsters');

  return (
    <div className='App'>
      <Header />
      <div>
        <a href='https://homebrewery.naturalcrit.com/new'>The Homebrewery - New Page</a>
        <Input setData={setData} type={type} setType={setType}></Input>
        <Result data={data} type={type}></Result>
      </div>
    </div>
  )
}

export default App
