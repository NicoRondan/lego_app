import React from 'react';
export default function BrickButton({children,color='red',className='',...props}){
  return <button className={`btn-brick ${color} ${className}`} {...props}>{children}</button>;
}
