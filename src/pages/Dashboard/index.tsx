
import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import api from '../../services/api';

import { useAuth } from '../../hooks/auth';
import {Container, Header, HeaderTitle, UserName, ProfileButton, UserAvatar , ProvidersList, ProviderContainer,
   ProviderAvatar, ProviderInfo, ProviderName, ProviderMeta, ProviderMetaText, ProvidersListTitle} from './styles';
import  Icon  from 'react-native-vector-icons/Feather';

export interface Provider{
  id:string;
  name:string;
  avatar_url:string;
}

const Dashboard: React.FC =()=> {
  const[providers, setProviders] = useState<Provider[]>([])
const { user} = useAuth();
const {navigate} = useNavigation();

useEffect(()=>{
  api.get('providers').then((response)=>{
    setProviders(response.data);
  })
},[]);

const navigateToPofile = useCallback(()=>{
  navigate('Profile');
}, [navigate])

const navigateToCreateAppointment = useCallback((providerId:string)=>{
  navigate('CreateAppointment', {providerId});
},[navigate])
  return(
  <Container>
    <Header>
      <HeaderTitle>
        Bem vindo, {"\n"}
  <UserName> {user.name}</UserName>
      </HeaderTitle>
      <ProfileButton onPress={navigateToPofile}>
        <UserAvatar source={{uri: user.avatar_url}}/>
      </ProfileButton>
    </Header>
   < ProvidersList data ={providers}
   keyExtractor={provider=>provider.id}
   ListHeaderComponent={<ProvidersListTitle>Cabeleireiros</ProvidersListTitle>}
   renderItem={({item:provider})=>(
   <ProviderContainer onPress={()=>navigateToCreateAppointment(provider.id)}>
     <ProviderAvatar source={{uri:provider.avatar_url}}/>
      <ProviderInfo>
   <ProviderName>{provider.name}</ProviderName>
   <ProviderMeta>
     <Icon name="calendar" size={14} color="#ff9000" />
     <ProviderMetaText>Segunda à Sexta</ProviderMetaText>
   </ProviderMeta>
   <ProviderMeta>
     <Icon name="clock" size={14} color="#ff9000" />
     <ProviderMetaText>8hrs às 18hrs</ProviderMetaText>
   </ProviderMeta>
      </ProviderInfo>
   </ProviderContainer>
   )} />


  </Container>
  )
}


export default Dashboard;