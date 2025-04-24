import { useState } from 'react'


function Input({ setData, type, setType }) {

	const url = 'https://www.dnd5eapi.co/api/'

	const types = [ 'monsters', 'spells', 'feats', 'magic-items'];
	const years = [ '2014', '2024'];

	const [ text, setText ] = useState('');
	const [ year, setYear ] = useState('2014')


	const fetchData = async function(e){
		e.preventDefault();
		if(!text) {
			setData(undefined);
			return;
		}

		const dataURL = `${url}${year}/${type}/${text}`;
		// console.log(dataURL);

		try {
			const response = (await fetch(dataURL));
			if (!response.ok) {
			  throw new Error(`Response status: ${response.status}`);
			}
		
			const json = await response.json();
			setData(json)
			return
		  } catch (error) {
			console.error(error.message);
		  }
		setData(undefined);
	};

	return <>
		<div className='input'>
			<form onSubmit={fetchData}>
				<label>
					<p>
						{url}
						<select onChange={(e)=>{setYear(e.target.value)}}>
							{years.map((year, index)=>{ return <option key={index}>{year}</option>;})}
						</select>
						/
						<select onChange={(e)=>{setType(e.target.value)}}>
							{types.map((type, index)=>{ return <option key={index}>{type}</option>;})}
						</select>
						/
						<input type='text' value={text} onChange={(e)=>{setText(e.target.value)}}></input>
					</p>
				</label>
				<input type="submit" value="Fetch"></input>
			</form>
		</div>
	</>;
}

export default Input;