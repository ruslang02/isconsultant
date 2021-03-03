import { render, screen } from '@testing-library/react';
import Navigation from './App';
import Profile from './Profile';

test('renders learn react link', () => {
  render(<Navigation />);
  render(<Profile/>);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
