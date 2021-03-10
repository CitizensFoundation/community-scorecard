import { YpCodeBase } from './@yrpri/YpCodeBaseclass.js';

export class CsServerApi extends YpCodeBase {
  protected baseUrlPath = '/api';

  static transformCollectionTypeToApi(type: string): string {

    let transformedApiType;

    switch (type) {
      case "domain":
        transformedApiType = "domains";
        break;
      case "community":
        transformedApiType = "communities";
        break;
      case "group":
        transformedApiType = "groups";
        break;
      case "post":
        transformedApiType = "posts";
        break;
      case "user":
        transformedApiType = "users";
        break;
      default:
        transformedApiType ="";
        console.error(`Cant find collection type transsform for ${type}`);
    }

    return transformedApiType;
  }

  private async fetchWrapper(url: string, options: RequestInit =  {}, showUserError = true) {
    if (!options.headers) {
      options.headers = {
        'Content-Type': 'application/json'
      }
    }
    const response = await fetch(url, options);
    return this.handleResponse(response, showUserError);
  }

  private async handleResponse(response: Response, showUserError: boolean) {
    if (response.ok) {
      let responseJson = null;
      try {
        responseJson = await response.json();
      } catch (error) {
        if (response.status===200 && response.statusText==="OK") {
          // Do nothing
        } else {
          this.fireGlobal('yp-network-error', {
            response: response,
            jsonError: error,
            showUserError,
          });
        }
      }
      return responseJson;
    } else {
      this.fireGlobal('yp-network-error', {
        response: response,
        showUserError,
      });
      return null;
    }
  }

  public boot() {
    return this.fetchWrapper(this.baseUrlPath + '/domains');
  }

  public isloggedin() {
    return this.fetchWrapper(
      this.baseUrlPath + '/users/loggedInUser/isloggedin'
    );
  }

  public postIssue(projectId: number, body: object) {
    return this.fetchWrapper(
      this.baseUrlPath + `/projects/${projectId}/addIssue`,
      {
        method: 'POST',
        body: JSON.stringify(body),
      },
      false
    );
  }

  public postParticipants(projectId: number, body: object) {
    return this.fetchWrapper(
      this.baseUrlPath + `/projects/${projectId}/addParticipants`,
      {
        method: 'POST',
        body: JSON.stringify(body),
      },
      false
    );
  }

  getProject(projectId: number) {
    return this.fetchWrapper(
      this.baseUrlPath + `/projects/${projectId}`
    );
  }

  getIssues(projectId: number, issueType: number | undefined) {
    return this.fetchWrapper(
      this.baseUrlPath + `/projects/${projectId}/issues/${issueType}`
    );
  }

  getParticipants(projectId: number) {
    return this.fetchWrapper(
      this.baseUrlPath + `/projects/${projectId}/participants`
    );
  }
}