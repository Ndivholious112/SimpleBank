import { InputHTMLAttributes, forwardRef } from 'react'

type Props = InputHTMLAttributes<HTMLInputElement>

const Input = forwardRef<HTMLInputElement, Props>(function Input(props, ref) {
  const { className = '', ...rest } = props
  return <input ref={ref} className={'input' + (className ? ' ' + className : '')} {...rest} />
})

export default Input
