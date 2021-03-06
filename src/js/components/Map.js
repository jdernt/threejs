import React, { Component } from 'react';
import data from '../data';


export default class Map extends Component {
	

	render() {
		const { currentId, action } = this.props;
		return (
			<div className='map' >
				<div className='map__container' onClick={action}>
					{data.map(({ id, coords }, i) => (
						<span 
							className='map__item js-dot' 
							key={id}
							data-id={id}					
							style={
								{	top: coords.z * 15 + 35 + '%',
									left: coords.x * 15 + 50 + '%',
									backgroundColor: id === currentId ? '#42f5e3' : '#3b04b3'
								}}
							>								
						</span>
					))}
				</div>
			</div>
		);
	}
}
