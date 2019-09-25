import MobxPromise from "mobxpromise";
import { ILazyMobXTableApplicationLazyDownloadDataFetcher } from "shared/lib/ILazyMobXTableApplicationLazyDownloadDataFetcher";
import LazyMobXCache from "shared/lib/LazyMobXCache";
import {
  default as MutationCountCache,
  fetch as fetchMutationCountData
} from "shared/cache/MutationCountCache";
import {
  default as GenomeNexusCache,
  fetch as fetchGenomeNexusData
} from "shared/cache/GenomeNexusCache";
import {
  default as DiscreteCNACache,
  fetch as fetchDiscreteCNAData
} from "shared/cache/DiscreteCNACache";
import { Mutation, MolecularProfile } from "shared/api/generated/CBioPortalAPI";
import _ from "lodash";
import {
  default as GenomeNexusMyVariantInfoCache,
  fetch as fetchGenomeNexusMyVariantInfoData
} from "shared/cache/GenomeNexusMyVariantInfoCache";

export class MutationTableDownloadDataFetcher
  implements ILazyMobXTableApplicationLazyDownloadDataFetcher {
  private allData: any[] | undefined = undefined;

  constructor(
    private mutationData: MobxPromise<Mutation[]>,
    private studyToMolecularProfileDiscrete?: {
      [studyId: string]: MolecularProfile;
    },
    private genomeNexusCache?: () => GenomeNexusCache,
    private genomeNexusMyVariantInfoCache?: () => GenomeNexusMyVariantInfoCache,
    private mutationCountCache?: () => MutationCountCache,
    private discreteCNACache?: () => DiscreteCNACache
  ) {
    // TODO labelMobxPromises(this); ?
  }

  public fetchAndCacheAllLazyData(): Promise<any[]> {
    if (this.allData) {
      return Promise.resolve(this.allData);
    }

    return new Promise<any[]>((resolve, reject) => {
      const promiseCachePairs = this.availablePromiseCachePairs();

      Promise.all(promiseCachePairs.promises)
        .then((allData: any[]) => {
          this.allData = allData;

          // add data to cache for future use
          for (let i = 0; i < allData.length; i++) {
            promiseCachePairs.caches[i].addData(allData[i]);
          }

          resolve(allData);
        })
        .catch(reject);
    });
  }

  private availablePromiseCachePairs(): {
    promises: Promise<any>[];
    caches: LazyMobXCache<any, any>[];
  } {
    const promises: Promise<any>[] = [];
    const caches: LazyMobXCache<any, any>[] = [];

    if (this.genomeNexusCache) {
      promises.push(this.fetchAllGenomeNexusData());
      caches.push(this.genomeNexusCache());
    }

    if (this.genomeNexusMyVariantInfoCache) {
      promises.push(this.fetchAllGenomeNexusMyVariantInfoData());
      caches.push(this.genomeNexusMyVariantInfoCache());
    }

    if (this.mutationCountCache) {
      promises.push(this.fetchAllMutationCountData());
      caches.push(this.mutationCountCache());
    }

    if (this.discreteCNACache) {
      promises.push(this.fetchAllDiscreteCNAData());
      caches.push(this.discreteCNACache());
    }

    return { promises, caches };
  }

  private async fetchAllGenomeNexusData() {
    if (this.mutationData.result) {
      return await fetchGenomeNexusData(this.mutationData.result);
    } else {
      return undefined;
    }
  }

  private async fetchAllGenomeNexusMyVariantInfoData() {
    if (this.mutationData.result) {
      return await fetchGenomeNexusMyVariantInfoData(this.mutationData.result);
    } else {
      return undefined;
    }
  }

  private async fetchAllMutationCountData() {
    if (this.mutationData.result) {
      const queries = this.mutationData.result.map(mutation => ({
        sampleId: mutation.sampleId,
        studyId: mutation.studyId
      }));

      return await fetchMutationCountData(queries);
    } else {
      return undefined;
    }
  }

  private async fetchAllDiscreteCNAData() {
    if (this.mutationData.result) {
      const queries = this.mutationData.result.map(mutation => ({
        sampleId: mutation.sampleId,
        studyId: mutation.studyId,
        entrezGeneId: mutation.entrezGeneId
      }));
      const cnaData = await fetchDiscreteCNAData(
        queries,
        this.studyToMolecularProfileDiscrete!
      );
      const modifiedCNAData = _.flatten(
        _.map(cnaData, rawData => {
          const mappedArray = _.map(_.flatten(rawData.data), props => {
            return { ...props, studyId: rawData.meta };
          });
          return mappedArray;
        })
      );
      return modifiedCNAData;
    } else {
      return undefined;
    }
  }
}
