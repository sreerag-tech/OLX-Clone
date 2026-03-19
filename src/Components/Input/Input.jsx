import React from "react";

function Input({ value, onChange, placeholder, name, type = "text" }) {
  return (
    <div className="pt-2 w-full relative">
      <input
        className="w-full mb-4 px-3 py-2 border rounded"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        name={name}
        type={type}
      />
      <label
        htmlFor={name}
        className="absolute pl-1 pr-1 left-2.5 top-0 bg-white text-sm peer-focus:top-0 peer-focus:text-sm transition-all duration-200 peer-placeholder-shown:text-base peer-placeholder-shown:top-5"
      >
        {placeholder}
      </label>
    </div>
  );
}

export default Input;
