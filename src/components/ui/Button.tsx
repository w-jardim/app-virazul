import React from 'react'

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode
}

const Button: React.FC<Props> = ({ children, className = '', ...rest }) => (
  <button
    className={"px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 " + className}
    {...rest}
  >
    {children}
  </button>
)

export default Button
