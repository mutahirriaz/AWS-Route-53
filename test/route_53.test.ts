import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as Route53 from '../lib/route_53-stack';

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new Route53.Route53Stack(app, 'MyTestStack');
    // THEN
    expectCDK(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});
