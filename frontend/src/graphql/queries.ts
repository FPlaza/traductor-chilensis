import { gql } from '@apollo/client';

export const TRADUCIR_MUTATION = gql`
  mutation Traducir($texto: String!, $region: String) {
    traducir(texto: $texto, region: $region) {
      textoOriginal
      textoTraducido
      region
      palabrasDetectadas
    }
  }
`;

export const HISTORIAL_QUERY = gql`
  query Historial($limit: Int) {
    historial(limit: $limit) {
      traducciones {
        id
        textoOriginal
        textoTraducido
        region
        palabrasDetectadas
        createdAt
      }
      total
    }
  }
`;

export const SUGERENCIAS_QUERY = gql`
  query Sugerencias($estado: EstadoSugerencia) {
    sugerencias(estado: $estado) {
      id
      palabra
      traduccionPropuesta
      descripcion
      region
      estado
      createdAt
    }
  }
`;

export const CREAR_SUGERENCIA_MUTATION = gql`
  mutation CrearSugerencia($input: CrearSugerenciaInput!) {
    crearSugerencia(input: $input) {
      id
      palabra
      traduccionPropuesta
      estado
    }
  }
`;

export const REGIONES_QUERY = gql`
  query Regiones {
    regiones {
      id
      nombre
      descripcion
    }
  }
`;

export const HEALTH_QUERY = gql`
  query Health {
    health {
      gateway
      traductor
      diccionario
      contexto
      sugerencias
    }
  }
`;
