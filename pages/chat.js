import { Box, Text, TextField, Image, Button } from '@skynexui/components';
import React from 'react';
import appConfig from '../config.json';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/router';
import { ButtonSendSticker } from '../src/components/ButtonSendSticker';



const SUPABASE_ANON_KEY = 'colar chave do BAAS aqui';
const SUPABASE_URL = 'colar URL do BAAS aqui';
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function escutaMensagensEmTempoReal(adicionaMensagem){
    return supabaseClient
        .from('mensagens')
        .on('INSERT', (respostaLive) => {
            console.log('Houve uma nova mensagem');
            adicionaMensagem(respostaLive.new);
        })
        .subscribe();
}


export default function ChatPage() {

    const roteamento = useRouter();
    const usuarioLogado = roteamento.query.username;
    // console.log('roteamento.query', roteamento.query);
    // console.log('usuarioLogado', usuarioLogado);

    
    const [mensagem, setMensagem] = React.useState('');
    const [listaDeMensagem, setlistaDeMensagem] = React.useState([]);

    // Usuário
    // - usuario digita campo textarea
    // - aperta enter para enviar
    // - tem q adicionar o texto na listagem

    // DEV
    // - |x| campo criado
    // - |x| vamos usar onChange, useState (ter if para caso seja enter para limpar variavel)
    // - |x| lista de mensagens

    React.useEffect(() => {
        supabaseClient
        .from('mensagens')
        .select('*')
        .order('id', { ascending: false })
        .then(({ data }) => {
            // console.log('Dados da consulta:', data);
            setlistaDeMensagem(data);
        });

        escutaMensagensEmTempoReal((novaMensagem) => {
            // handleNovaMensagem(novaMensagem)
            setlistaDeMensagem((valorAtualDaLista) => {
                return [
                novaMensagem,
                ...valorAtualDaLista,
                ]
            });
        });
    }, []);
    

    function handleNovaMensagem(novaMensagem) {
        const mensagem = {
            // id: (listaDeMensagem.length + 1),
            de: usuarioLogado,
            texto: novaMensagem,
        };

        supabaseClient
            .from('mensagens')
            .insert([
                // Tem q ser um objeto com os mesmos campos q vc escreveu no supabase
                mensagem
            ])
            .then(({ data }) => {                
            });

        setMensagem('');
    }

    function apagaMensagem(key) {
                

        supabaseClient
            .from('mensagens')
            .delete()
            .match({ id : key})
            .then(({ data }) => {    
                const listaFiltrada = listaDeMensagem.filter((x) => {
                    return x.id != key;
                });
                setlistaDeMensagem(listaFiltrada);
            });
        
    };

    return (
        <Box
            styleSheet={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                backgroundColor: appConfig.theme.colors.primary[500],
                backgroundImage: `url(https://virtualbackgrounds.site/wp-content/uploads/2020/08/the-matrix-digital-rain.jpg)`,
                backgroundRepeat: 'no-repeat', backgroundSize: 'cover', backgroundBlendMode: 'multiply',
                color: appConfig.theme.colors.neutrals['000']
            }}
        >
            <Box
                styleSheet={{
                    display: 'flex',
                    flexDirection: 'column',
                    flex: 1,
                    boxShadow: '0 2px 10px 0 rgb(0 0 0 / 20%)',
                    borderRadius: '5px',
                    backgroundColor: appConfig.theme.colors.neutrals[700],
                    height: '100%',
                    maxWidth: '95%',
                    maxHeight: '95vh',
                    padding: '32px',
                }}
            >
                <Header />
                <Box
                    styleSheet={{
                        position: 'relative',
                        display: 'flex',
                        flex: 1,
                        height: '80%',
                        backgroundColor: appConfig.theme.colors.neutrals[600],
                        flexDirection: 'column',
                        borderRadius: '5px',
                        padding: '16px',
                    }}
                >


                    <MessageList mensagens={listaDeMensagem} apaga={apagaMensagem}/>
                    {/* Lista de Mensagens: {listaDeMensagem.map((mensagemAtual) => {
                        
                        return (
                            <li key={mensagemAtual.id}>
                                {mensagemAtual.de}: {mensagemAtual.texto}
                            </li>
                        )
                    })} */}

                    <Box
                        as="form"
                        styleSheet={{
                            display: 'flex',
                            alignItems: 'center',
                        }}
                    >
                        <TextField
                            value={mensagem}
                            onChange={(event) => {
                                const valor = event.target.value;
                                setMensagem(valor);
                            }}
                            onKeyPress={(event) => {
                                if (event.key === 'Enter') {
                                    event.preventDefault();
                                    handleNovaMensagem(mensagem);
                                }
                            }}
                            placeholder="Insira sua mensagem aqui..."
                            type="textarea"
                            styleSheet={{
                                width: '100%',
                                border: '0',
                                resize: 'none',
                                borderRadius: '5px',
                                padding: '6px 8px',
                                backgroundColor: appConfig.theme.colors.neutrals[800],
                                marginRight: '12px',
                                color: appConfig.theme.colors.neutrals[200],
                            }}
                        />
                        {/* CallBack */}
                        <ButtonSendSticker 
                            onStickerClick={(sticker) => {
                                console.log('[USANDO O COMPONENTE] Salva este sticker no banco', sticker);
                                handleNovaMensagem(':sticker: ' + sticker);
                            }}
                        
                        />
                    </Box>
                </Box>
            </Box>
        </Box>
    )
}

function Header() {
    return (
        <>
            <Box styleSheet={{ width: '100%', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} >
                <Text variant='heading5'>
                    Chat
                </Text>
                <Button
                    variant='tertiary'
                    colorVariant='neutral'
                    label='Logout'
                    href="/"
                />
            </Box>
        </>
    )
}

function MessageList(props) {
    console.log(props);
    return (
        <Box
            tag="ul"
            styleSheet={{
                overflow: 'scroll',
                display: 'flex',
                flexDirection: 'column-reverse',
                flex: 1,
                color: appConfig.theme.colors.neutrals["000"],
                marginBottom: '16px',
            }}
        >
            {props.mensagens.map((mensagem) => {
                return (
                    <Text
                        key={mensagem.id}
                        tag="li"
                        styleSheet={{
                            borderRadius: '5px',
                            padding: '6px',
                            marginBottom: '12px',
                            hover: {
                                backgroundColor: appConfig.theme.colors.neutrals[700],
                            }
                        }}
                    >
                        <Box
                            styleSheet={{
                                marginBottom: '8px',
                            }}
                        >
                            <Image
                                styleSheet={{
                                    width: '20px',
                                    height: '20px',
                                    borderRadius: '50%',
                                    display: 'inline-block',
                                    marginRight: '8px',
                                }}
                                src={`https://github.com/${mensagem.de}.png`}
                            />
                            <Text tag="strong">
                                {mensagem.de}
                            </Text>
                            <Text
                                styleSheet={{
                                    fontSize: '10px',
                                    marginLeft: '8px',
                                    color: appConfig.theme.colors.neutrals[300],
                                }}
                                tag="span"
                            >
                                {(new Date().toLocaleDateString())}
                            </Text>
                            {/* desafio inserção de botão para excluir a mensagem */}
                            <Button
                                styleSheet={{
                                    borderRadius: '5%',
                                    marginLeft: '8px',                                
                                    fontSize: '10px',                     
                                    }
                                  }                                
                                onClick={() => {
                                    console.log("Mandou apagar msg", mensagem.id);                                    
                                    props.apaga(mensagem.id);
                                }}
                                label='X'
                                buttonColors={{
                                contrastColor: appConfig.theme.colors.neutrals["000"],
                                mainColor: appConfig.theme.colors.primary[500],
                                mainColorLight: appConfig.theme.colors.primary[400],
                                // mainColorStrong: appConfig.theme.colors.primary[600],
                                mainColorStrong: 'red',
                                }}
                            />

                            
                        </Box>
                        {/* Condicional: {mensagem.texto.startsWith(':sticker:').toString()} */}
                        {mensagem.texto.startsWith(':sticker:')
                            ? (
                                <Image src={mensagem.texto.replace(':sticker:', '')} />
                            )
                            : (
                                mensagem.texto
                            )}
                        {/* {mensagem.texto} */}
                    </Text>
                );
            })}
        </Box>
    )
}