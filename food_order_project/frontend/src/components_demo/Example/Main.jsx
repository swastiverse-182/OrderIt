import FoodItem from './FoodItem'

const Main = () => {
  return (
    <div>
      <FoodItem item="Burger" price={200}/>
      <FoodItem item="Pizza" price={550}/>
    </div>
  )
}

export default Main