import { ButtonHTMLAttributes } from 'react'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'primary'
}

export default function Button({ variant = 'default', className = '', ...rest }: Props) {
  const base = 'btn'
  const v = variant === 'primary' ? ' btn-primary' : ''
  return <button className={base + v + (className ? ' ' + className : '')} {...rest} />
}
