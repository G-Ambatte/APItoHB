import './header.css'

import React from 'react'

function Header() {
  return <>
	<div className='header'>
		<img className='left' src='logo512.png' />
		<p> D&D 5E API to Homebrewery Converter</p>
		<img className='right' src='logo512.png' />
	</div>
  </>
}

export default Header;