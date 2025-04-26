import { useState } from 'react'

import { raceQuery } from '../types/races';
import { srdAttribution } from '../types/srdAttribution';


function Input({ setData, type, setType }) {

	const url = 'https://www.dnd5eapi.co/api/'

	const types = [ 'monsters', 'spells', 'feats', 'magic-items', 'races' ];
	const years = [ '2014', '2024'];

	const [ text, setText ] = useState('');
	const [ year, setYear ] = useState('2014');
	const [ srdAttrib, setSrdAttrib ] = useState(true);


	const fetchData = async function(e){
		e.preventDefault();
		if(!text) {
			setData(undefined);
			return;
		}

		const dataURL = `${url}${year}/${type}/${text}`;
		// console.log(dataURL);

		try {
			let response;
			if(type != 'races') {
				response = await fetch(dataURL);
			} else {
				response = await fetch(`https://www.dnd5eapi.co/graphql/${year}`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body : JSON.stringify({
						query     : raceQuery,
						variables : { index : text }
					})
				})
			}
			if (!response.ok) {
			  throw new Error(`Response status: ${response.status}`);
			}
		
			const apiData = await response.json();
			if(srdAttrib){
				const srdMap = {
					'2014' : '5.1',
					'2024' : '5.2'
				}
				apiData.data.srdAttrib = srdAttribution(srdMap[year]);
			};

			setData(apiData)
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
				<label>
					<p>
						Include attribution?
						<input type='checkbox' defaultChecked={srdAttrib} onChange={()=>{
							console.log(srdAttrib);
							setSrdAttrib(!srdAttrib);
						}}/>
					</p>
				</label>
			</form>
		</div>
	</>;
}

export default Input;