import React, {useRef, useCallback} from 'react';
import {ScrollView, KeyboardAvoidingView, Platform, View, TextInput, Alert} from 'react-native';
import *as Yup from 'yup';
import api from '../../services/api';
import {useNavigation} from '@react-navigation/native';
import {Form} from '@unform/mobile';
import {FormHandles} from '@unform/core';
import Icon from 'react-native-vector-icons/Feather';
import ImagePicker from 'react-native-image-picker';

import Input from '../../components/Input/index';
import Button from '../../components/Button/index';
import getValidationErrors from '../../utils/getValidationErrors';

import {Container, BackButton, Title, UserAvatarButton, UserAvatar} from './styles';
import { useAuth } from '../../hooks/auth';

interface ProfileFormData{
name:string;
email:string;
old_password:string;
password:string;
password_confirmation:string;
}

const SignUp : React.FC =()=>{
const {user, updateUser} = useAuth()

  const formRef = useRef<FormHandles>(null);
  const navigation = useNavigation();

  const emailInputRef = useRef<TextInput>(null);
  const oldPasswordInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);
  const confirmPasswordInputRef = useRef<TextInput>(null);

  const handleGoBack = useCallback(()=>{
    navigation.goBack();
  }, [navigation]);

  const handleSignUp = useCallback(
    async (data: ProfileFormData) => {
      try {
        formRef.current?.setErrors({});
        const schema = Yup.object().shape({
          name: Yup.string().required('Nome obrigátorio'),
          email: Yup.string()
            .required('E-mail obrigatório')
            .email('Digite um e-mail valido'),
          old_password: Yup.string(),
          password: Yup.string().when('old_password', {
            is: val => !!val.length,
            then: Yup.string().required('Campo obrigatório'),
            otherwise: Yup.string(),
          }),
          password_confirmation: Yup.string()
            .when('old_password', {
              is: val => !!val.length,
              then: Yup.string().required('Campo obrigatório'),
              otherwise: Yup.string(),
            })
            .oneOf([Yup.ref('password'), undefined], 'Confirmação incorreta'),
        });
        await schema.validate(data, { abortEarly: false });

        const {
          name,
          email,
          old_password,
          password,
          password_confirmation,
        } = data;
        const formData = {
          name,
          email,
          ...(old_password
            ? {
                old_password,
                password,
                password_confirmation,
              }
            : {}),
        };


        const response = await api.put('/profile', formData);

        updateUser(response.data);

        Alert.alert('Perfil actualizado com sucesso!',
         )
        navigation.goBack();


      } catch (err) {
        if (err instanceof Yup.ValidationError) {
          const errors = getValidationErrors(err);
          formRef.current?.setErrors(errors);
          return;
        }
        Alert.alert('Erro na actualização do perfil', 'Ocorreu um erro ao actualizar seu perfil, tente novamente');
      }
    },
    [navigation, updateUser],
  );

  const handleUpdateAvatar = useCallback(()=>{
    ImagePicker.showImagePicker({
      title:'Selecione um avatar',
      cancelButtonTitle: 'Cancelar',
      takePhotoButtonTitle:'Usar câmera',
      chooseFromLibraryButtonTitle:'Escolhe da galeria'
    }, (response) =>{
      if(response.didCancel){
        return;
      }if (response.error){
        Alert.alert('Erro ao actualizar seu avatar.');
        return;
      }
      const source ={uri:response.uri};
      const data = new FormData();

      data.append('avatar',{
        type:'image/jpg',
        name:`${user.id}.jpeg`,
        uri:response.uri,
      });

      api.patch('users/avatar', data).then((apiResponse)=>{
        updateUser(apiResponse.data);
      });
    });
  },[updateUser, user.id]);
  return(
    <>
    <KeyboardAvoidingView style={{ flex:1}}
     behavior={Platform.OS == 'ios' ? "padding" : undefined} enabled>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle ={{flex:1}}>
      <Container>
        <BackButton onPress={handleGoBack}>
          <Icon name= "chevron-left" size ={24} color = "#999591" />
        </BackButton>
        <UserAvatarButton onPress={handleUpdateAvatar}>
          <UserAvatar source ={{uri:user.avatar_url}} />
        </UserAvatarButton>

        <View>

        <Title>Meu Perfil</Title>
        </View>
        <Form initialData={user} ref={formRef} onSubmit ={handleSignUp} >

        <Input autoCapitalize = "words" name="name" icon="user" placeholder="Nome"
         returnKeyType = "next"
         onSubmitEditing ={()=>{
           emailInputRef.current?.focus()
         }}/>

        <Input
        ref ={emailInputRef}
        keyboardType="email-address"
        autoCorrect={false} autoCapitalize ="none"
        name="email" icon="mail" placeholder="E-mail"
        returnKeyType = "next"
        onSubmitEditing ={()=>{
          oldPasswordInputRef.current?.focus()
        }}/>


        <Input
        ref ={oldPasswordInputRef}
        secureTextEntry name="old_password" icon="lock"
        textContentType="newPassword" placeholder="Senha actual"
        returnKeyType ="next"
        containerStyle ={{marginTop:16}}
        onSubmitEditing ={()=>{
          passwordInputRef.current?.focus()}}/>

      <Input
        ref ={passwordInputRef}
        secureTextEntry name="password" icon="lock"
        textContentType="newPassword" placeholder="Nova senha"
        returnKeyType ="next" onSubmitEditing ={()=>{
          confirmPasswordInputRef.current?.focus()}}/>

      <Input
        ref ={confirmPasswordInputRef}
        secureTextEntry name="password_confirmation" icon="lock"
        textContentType="newPassword" placeholder="Confirmar senha"
        returnKeyType ="send" onSubmitEditing ={()=>formRef.current?.submitForm()}/>
        </Form>
        <Button onPress={()=>formRef.current?.submitForm()}>Confirmar mudanças</Button>


      </Container>
      </ScrollView>
    </KeyboardAvoidingView>
    </>
  )
}

export default SignUp;
