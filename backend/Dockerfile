FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY FloriculturaEmbeleze/FloriculturaEmbeleze.API/FloriculturaEmbeleze.API.csproj FloriculturaEmbeleze/FloriculturaEmbeleze.API/
COPY FloriculturaEmbeleze/FloriculturaEmbeleze.Application/FloriculturaEmbeleze.Application.csproj FloriculturaEmbeleze/FloriculturaEmbeleze.Application/
COPY FloriculturaEmbeleze/FloriculturaEmbeleze.Domain/FloriculturaEmbeleze.Domain.csproj FloriculturaEmbeleze/FloriculturaEmbeleze.Domain/
COPY FloriculturaEmbeleze/FloriculturaEmbeleze.Infrastructure/FloriculturaEmbeleze.Infrastructure.csproj FloriculturaEmbeleze/FloriculturaEmbeleze.Infrastructure/
RUN dotnet restore FloriculturaEmbeleze/FloriculturaEmbeleze.API/FloriculturaEmbeleze.API.csproj

COPY FloriculturaEmbeleze/ FloriculturaEmbeleze/
RUN dotnet publish FloriculturaEmbeleze/FloriculturaEmbeleze.API/FloriculturaEmbeleze.API.csproj -c Release -o /app/publish --no-restore

FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production
ENTRYPOINT ["dotnet", "FloriculturaEmbeleze.API.dll"]
