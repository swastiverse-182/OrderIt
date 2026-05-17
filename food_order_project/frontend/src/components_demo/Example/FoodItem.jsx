import React from 'react'

const FoodItem = ({ item, price }) => {

 return (
  <div style={{border: "1px solid black", padding:"10px", margin:"10px", borderRadius:"10px", width: "200px"}}>
    <h2>{item}</h2>
    <h2>{price}</h2>
    <button style={{backgroundColor:"yellow", cursor:"pointer"}}>Add to Cart</button>
  </div>
 )
}

export default FoodItem