#!/usr/bin/env python3
"""
Contacts Application Infrastructure
AWS CDK Python implementation for full-stack contacts management application
"""

import os
from aws_cdk import App, Environment
from contacts_infra.backend_stack import BackendStack
from contacts_infra.frontend_stack import FrontendStack


def main():
    """Main CDK application entry point"""
    
    # Get environment variables with defaults
    app_name = os.getenv('APP_NAME', 'Contacts')
    root_domain = os.getenv('ROOT_DOMAIN')
    frontend_subdomain = os.getenv('FRONTEND_SUBDOMAIN', 'www')
    
    # AWS environment configuration
    # NOTE: AWS CDK grabs this info from os under the hood. These are set in our os via our ci-cd.
    # env = Environment(
    #     account=os.getenv('CDK_DEFAULT_ACCOUNT'),
    #     region=os.getenv('CDK_DEFAULT_REGION', 'us-east-1')
    # )
    
    # Create CDK app
    app = App()
    
    # Deploy backend stack
    backend_stack = BackendStack(
        app, 
        f"{app_name}BackendStack",
        app_name=app_name,
        root_domain=root_domain,
        # env=env
    )
    
    # Deploy frontend stack
    frontend_stack = FrontendStack(
        app, 
        f"{app_name}FrontendStack",
        app_name=app_name,
        root_domain=root_domain,
        frontend_subdomain=frontend_subdomain,
        # env=env
    )
    
    # Add dependency: frontend depends on backend
    frontend_stack.add_dependency(backend_stack)
    
    # Synthesize the app
    app.synth()


if __name__ == "__main__":
    main()
