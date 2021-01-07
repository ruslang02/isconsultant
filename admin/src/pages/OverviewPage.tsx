import Card from '@material-ui/core/Card';
import React from 'react';

function OverviewPage() {
  return (
    <div style={{display: 'grid', gridTemplateColumns: 'auto auto auto auto', gap: '1rem', padding: '1rem'}}>
      <Card raised></Card>
      <Card raised></Card>
      <Card raised></Card>
      <Card raised></Card>
      <Card raised></Card>
    </div>
  )
}

export default OverviewPage;