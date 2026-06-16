import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ChilensisResolver } from './resolvers/chilensis.resolver';
import { MicroserviciosService } from './services/microservicios.service';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      typePaths: ['./**/*.graphql'],
      playground: true,
      introspection: true,
    }),
  ],
  providers: [ChilensisResolver, MicroserviciosService],
})
export class AppModule {}