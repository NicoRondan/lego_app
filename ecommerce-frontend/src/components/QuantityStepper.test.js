import React from 'react';
import ReactDOM from 'react-dom';
import TestUtils from 'react-dom/test-utils';
import QuantityStepper from './QuantityStepper';

describe('QuantityStepper', () => {
  it('increments and decrements within bounds', () => {
    const handleChange = jest.fn();
    const container = document.createElement('div');
    ReactDOM.render(
      <QuantityStepper value={2} min={1} max={5} onChange={handleChange} />,
      container,
    );
    const [dec, inc] = container.querySelectorAll('button');
    TestUtils.Simulate.click(inc);
    expect(handleChange).toHaveBeenCalledWith(3);
    TestUtils.Simulate.click(dec);
    expect(handleChange).toHaveBeenCalledWith(1);
  });

  it('enforces max when typing beyond limit', () => {
    const handleChange = jest.fn();
    const container = document.createElement('div');
    ReactDOM.render(
      <QuantityStepper value={2} min={1} max={4} onChange={handleChange} />,
      container,
    );
    const input = container.querySelector('input');
    TestUtils.Simulate.change(input, { target: { value: '10' } });
    expect(handleChange).toHaveBeenCalledWith(4);
  });
});
