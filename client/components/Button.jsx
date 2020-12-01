import styled from 'styled-components';
import colors from '../Colors.scss';

export const Button = styled.div`
  border-radius: 3px;
  background-color: ${props => props.color};
  color: white;
  padding: .5rem 1rem;
  font-size: 16px;
  display: inline-block;
  cursor: pointer;
`;