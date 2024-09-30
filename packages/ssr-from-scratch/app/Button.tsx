'use client'

import React from 'react'

const Button = () => {
  // const [count, setCount] = React.useState(0);
  //   const handleButtonClick = () => {
  //      setCount((prev) => prev + 1);
  //   }
  return (
    <button onClick={() => console.log("Clicked!!")}>Hi there</button>
  )
}

export default Button