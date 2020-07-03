import {
  OctokitPlugin,
  OctokitRequestOptions,
  RequestDescriptor,
} from '../../types';

import { requestRouteMatcher } from './routeMatcher';
import { Serializers } from './serialize';

type RunArtifact = { data: any; requests: Set<[string, RequestDescriptor]> };

const ARTIFACTS = new Set<RunArtifact>();

export const SerializerOctokitPlugin: OctokitPlugin = (
  octokit: Parameters<OctokitPlugin>[0],
  clientOptions: Parameters<OctokitPlugin>[1],
) => {
  console.log('[SerializerOctokitPlugin] | Plugin Called: ', clientOptions);

  const match = clientOptions.serializer.routes
    ? requestRouteMatcher(clientOptions.serializer.routes)
    : undefined;

  if (
    clientOptions.serializer.enabled !== false &&
    clientOptions.serializer.deserialize !== true
  ) {
    const artifact: RunArtifact = {
      data: clientOptions.serializer,
      requests: new Set(),
    };

    ARTIFACTS.add(artifact);

    octokit.hook.wrap(
      'request',
      async (
        request,
        requestOptions: OctokitRequestOptions,
      ): Promise<unknown> => {
        if (!match || match.test(requestOptions.url)) {
          console.log('[SerializerOctokitPlugin] | Request | ', requestOptions);

          const serializer = Serializers.get(requestOptions.url);

          if (!serializer) {
            throw new Error(
              '[SerializerOctokitPlugin] | Attempted to serialize a path that is not handled',
            );
          }

          const data = await serializer.serialize(requestOptions);

          artifact.requests.add([requestOptions.url, data]);

          return data.result;
          // temp actually make requests
        }
        return request(requestOptions);
      },
    );
  }

  return {
    /**
     * Returns the serialized artifacts that can be uploaded to github artifacts
     */
    getSerializedArtifacts(): string[] {
      return [...ARTIFACTS].map((artifact) =>
        JSON.stringify({
          data: artifact.data,
          requests: Array.from(artifact.requests),
        }),
      );
    },
    async deserializeArtifact(artifacts: string[]) {
      for (const serializedArtifact of artifacts) {
        const { requests }: RunArtifact = JSON.parse(serializedArtifact);
        for (const [route, descriptor] of requests) {
          console.log(
            '[SerializerOctokitPlugin] | Deserializing A Route: ',
            route,
            descriptor,
          );
          const serializer = Serializers.get(route);
          if (!serializer) {
            throw new Error(
              `[SerializerOctokitPlugin] | Attempted to deserialize a path "${route}" which is not handled`,
            );
          }
          await serializer.deserialize(descriptor, octokit);
        }
      }
    },
  };
};
