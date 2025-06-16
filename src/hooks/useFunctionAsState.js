import { useState } from 'react'

// When you want to use a function as your state value, the function will be called directly.
// So it uses the return value as a quick trick to your state. If you want to for example
// store an callback in state... this custom hooks gives you a simpler interface.
// you now do now have to update all your setstates of callbacks like:
//    setState(() => () => console.log('hurray'))
// but can simply do:
//    setState(() => console.log('hurray'))
// for more info on this topic this is the github topic: https://github.com/facebook/react/issues/14087

export default function useFunctionAsState (fn) {
  const [val, setVal] = useState(() => fn)

  function setFunc (fn) {
    setVal(() => fn)
  }

  return [val, setFunc]
}
