import { Page } from "components/Page";
import React from "react";
import { Pagination, Icon, Item, Button } from "semantic-ui-react";

const LawyersPage = () => {
  return (
    <Page>
      <h2>Lawyers Directory<br /><small style={{ color: "grey" }}>View all lawyers in ISConsultant.</small></h2>
      <Item.Group>
        <Item>
          <Item.Image size='tiny' src='https://react.semantic-ui.com/images/avatar/large/elliot.jpg' />

          <Item.Content>
            <Item.Header as='a'>Egor Dadugin</Item.Header>
            <Item.Description>
              A first-class specialist, has a degree in law at Oxford University. Over 10 years of law advisory experience. Currently works at UnLaw Inc.
            </Item.Description>
            <Item.Extra>More Details</Item.Extra>
            <Button floated="right" content="Request a meeting" primary />
          </Item.Content>
        </Item>

        <Item>
          <Item.Image size='tiny' src='https://react.semantic-ui.com/images/avatar/large/elliot.jpg' />

          <Item.Content>
            <Item.Header as='a'>Egor Dadugin</Item.Header>
            <Item.Description>
              A first-class specialist, has a degree in law at Oxford University. Over 10 years of law advisory experience. Currently works at UnLaw Inc.
    </Item.Description>
            <Item.Extra>More Details</Item.Extra>
            <Button floated="right" content="Request a meeting" primary />
          </Item.Content>
        </Item>

        <Item>
          <Item.Image size='tiny' src='https://react.semantic-ui.com/images/avatar/large/elliot.jpg' />

          <Item.Content>
            <Item.Header as='a'>Egor Dadugin</Item.Header>
            <Item.Description>
              A first-class specialist, has a degree in law at Oxford University. Over 10 years of law advisory experience. Currently works at UnLaw Inc.
    </Item.Description>
            <Item.Extra>More Details</Item.Extra>
            <Button floated="right" content="Request a meeting" primary />
          </Item.Content>
        </Item>

        <Item>
          <Item.Image size='tiny' src='https://react.semantic-ui.com/images/avatar/large/elliot.jpg' />

          <Item.Content>
            <Item.Header as='a'>Egor Dadugin</Item.Header>
            <Item.Description>
              A first-class specialist, has a degree in law at Oxford University. Over 10 years of law advisory experience. Currently works at UnLaw Inc.
    </Item.Description>
            <Item.Extra>More Details</Item.Extra>
            <Button floated="right" content="Request a meeting" primary />
          </Item.Content>
        </Item>

        <Item>
          <Item.Image size='tiny' src='https://react.semantic-ui.com/images/avatar/large/elliot.jpg' />

          <Item.Content>
            <Item.Header as='a'>Egor Dadugin</Item.Header>
            <Item.Description>
              A first-class specialist, has a degree in law at Oxford University. Over 10 years of law advisory experience. Currently works at UnLaw Inc.
    </Item.Description>
            <Item.Extra>More Details</Item.Extra>
            <Button floated="right" content="Request a meeting" primary />
          </Item.Content>
        </Item>
      </Item.Group>
      <Pagination
        defaultActivePage={1}
        ellipsisItem={{ content: <Icon name='ellipsis horizontal' />, icon: true }}
        firstItem={{ content: <Icon name='angle double left' />, icon: true }}
        lastItem={{ content: <Icon name='angle double right' />, icon: true }}
        prevItem={{ content: <Icon name='angle left' />, icon: true }}
        nextItem={{ content: <Icon name='angle right' />, icon: true }}
        totalPages={3}
      />
    </Page>
  )
};

export default LawyersPage;